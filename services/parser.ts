
import { ParsedData, MessageInfo } from '../types';

/**
 * Extracts escaped JSON blocks starting with {\"BusMsg
 * Handles the backslash-escaped braces and quotes.
 */
export const extractAllBusMsgs = (xml: string): string[] => {
  const results: string[] = [];
  let searchIndex = 0;

  // We look for the start of the escaped JSON string
  const pattern = '{\\"BusMsg'; 
  
  while (true) {
    let startIndex = xml.indexOf(pattern, searchIndex);
    if (startIndex === -1) break;

    let braceCount = 0;
    let endIndex = -1;
    let isEscaped = false;

    for (let i = startIndex; i < xml.length; i++) {
      const char = xml[i];
      const nextChar = xml[i + 1];

      // Handle the escaped character flag
      if (char === '\\' && !isEscaped) {
        isEscaped = true;
        continue;
      }

      if (char === '{' && !isEscaped) braceCount++;
      if (char === '}' && !isEscaped) {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
      
      isEscaped = false;
    }

    if (endIndex !== -1) {
      let rawMatch = xml.substring(startIndex, endIndex + 1);
      // Unescape the string: \" becomes ", \\ becomes \
      let unescaped = rawMatch.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      results.push(unescaped);
      searchIndex = endIndex + 1;
    } else {
      break;
    }
  }

  return results;
};

/**
 * Safely navigates deep objects
 */
const getDeep = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const parseXmlMessages = (xml: string): ParsedData => {
  const allBusMsgs = extractAllBusMsgs(xml);
  
  const getJson = (index: number) => {
    if (!allBusMsgs[index]) return undefined;
    try {
      return JSON.parse(allBusMsgs[index]);
    } catch (e) {
      console.error("JSON Parse Error at index " + index, e);
      return { error: "JSON Inválido", raw: allBusMsgs[index] };
    }
  };

  const mapJsonToInfo = (json: any, fallbackType: string): MessageInfo | undefined => {
    if (!json || !json.BusMsg) return undefined;
    
    const busMsg = json.BusMsg;
    const doc = busMsg.Document || {};
    
    // Check if it's a pacs.002 or pacs.008
    const msgDef = getDeep(busMsg, 'AppHdr.MsgDefIdr') || '';
    const is002 = msgDef.includes('pacs.002');
    
    let info: MessageInfo = {
      type: msgDef || fallbackType,
      id: getDeep(busMsg, 'AppHdr.BizMsgIdr') || getDeep(doc, 'FIToFIPmtStsRpt.GrpHdr.MsgId') || getDeep(doc, 'FIToFICstmrCdtTrf.GrpHdr.MsgId'),
      timestamp: getDeep(busMsg, 'AppHdr.CreDt') || getDeep(doc, 'FIToFIPmtStsRpt.GrpHdr.CreDtTm'),
      busMsg: json
    };

    if (is002) {
      const txInf = getDeep(doc, 'FIToFIPmtStsRpt.TxInfAndSts.0') || getDeep(doc, 'FIToFIPmtStsRpt.TxInfAndSts');
      if (txInf) {
        info.endToEndId = txInf.OrgnlEndToEndId;
        info.status = txInf.TxSts;
        const rsn = getDeep(txInf, 'StsRsnInf.0.Rsn.Prtry') || getDeep(txInf, 'StsRsnInf.Rsn.Prtry');
        if (rsn) info.reason = rsn;
      }
    } else {
      // pacs.008 logic
      const txInf = getDeep(doc, 'FIToFICstmrCdtTrf.CdtTrfTxInf.0') || getDeep(doc, 'FIToFICstmrCdtTrf.CdtTrfTxInf');
      if (txInf) {
        info.endToEndId = txInf.PmtId?.EndToEndId;
        info.amount = txInf.IntrBkSttlmAmt?.content || txInf.IntrBkSttlmAmt;
      }
    }

    return info;
  };

  const data: ParsedData = {
    allBusMsgs
  };

  // Following the requested sequence: 1st=008, 2nd=002 Ret, 3rd=002 Fin
  const json1 = getJson(0);
  const json2 = getJson(1);
  const json3 = getJson(2);

  if (json1) data.pacs008 = mapJsonToInfo(json1, 'pacs.008');
  if (json2) data.pacs002Return = mapJsonToInfo(json2, 'pacs.002 (Retorno)');
  if (json3) data.pacs002Final = mapJsonToInfo(json3, 'pacs.002 (Final)');

  return data;
};
