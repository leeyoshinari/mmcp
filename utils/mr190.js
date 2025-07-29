// 湖北省点配送
const host = window.location.origin;
const textContainer = document.getElementsByClassName("logs")[0];
let headers = {};

async function query_company(org_name, res) {
    try {
        const encodedOrgName = encodeURIComponent(org_name);
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/QueryCom.HSNN?COMID=&type=2&COMNAME=${encodedOrgName}`;
        const data = {
            '_search': false,
            'nd': Date.now(),
            'rows': 10,
            'page': 1,
            'sidx': null,
            'sord': 'asc'
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.total > 0) {
            res['cid'] = response.rows[0].COMID;
            return res;
        } else {
            throw new Error(`查询企业结果为空，企业名称：${org_name}，查询结果：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_zu(zu_code, res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/QueryGpart.HSNN?PROCURECATALOGID=${zu_code}&GPARTNAME=&REGCARDNM=&COMNAME_SC=&GTYPENAME=&SORTNAME=`;
        const data = {
            '_search': false,
            'nd': Date.now(),
            'rows': 10,
            'page': 1,
            'sidx': null,
            'sord': 'asc'
        };
        
        const response = await fetchPost(url, data, headers);
        if (response.total > 0) {
            res['pid'] = response.rows[0].PROCURECATALOGID;
            return res;
        } else {
            throw new Error(`查询组件编号为空，组件编号：${zu_code}，查询结果：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function query_send_result(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/QueryAreaByComgpart.HSNN?cid=${res['cid']}&pid=${res['pid']}`;
        const response = await fetchPost(url, {}, headers);
        return response.retval;
    } catch (error) {
        throw new Error(`查询配送结果失败，组件编号：${res['pid']}，错误：${error.message}`);
    }
}

async function query_areas(area, res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/AreaController/QueryArea.HSNN`;
        const data = {
            'gname': '',
            'cid': res['cid'],
            'pid': res['pid'],
            'type': 2
        };
        
        const response = await fetchPost(url, data, headers);
        let ids = null;
        
        for (const a of response) {
            if (area === a.name) {
                ids = a.id;
                break;
            }
        }
        
        if (ids) {
            return ids;
        } else {
            throw new Error(`未找到配送地区，配送地区：${area}，所有地区：${JSON.stringify(response)}`);
        }
    } catch (error) {
        throw error;
    }
}

async function sends(res) {
    try {
        const url = `${host}/HSNN/CM/Trade/Web/Controller/DistributionController/SetDistributionByCom_NEW.HSNN?cid=${res['cid']}&pid=${res['pid']}&ids=${res['ids']}&oldids=${res['oldids']}`;
        const response = await fetchPost(url, {}, headers);
        return response.retcode;
    } catch (error) {
        throw new Error(`配送失败，参数：${JSON.stringify(res)}，错误：${error.message}`);
    }
}

async function startTask190(dataList, header) {
    let total_num = 0;
    let success = 0;
    let has_send = 0;
    headers = convertHeadersArrayToObject(header);
    headers['content-type'] = 'application/x-www-form-urlencoded';
    try {
        for (let j = 0; j < dataList.length; j++) {
            let i = 0;
            const data = dataList[j];
            for (i; i < data.length; i++) {
                if (data[i][0] === '组件编码') break;
            }
            i += 1;
            for (i; i < data.length; i++) {
                if (!data[i][0]) continue;
                total_num += 1;
                let mcs_code = data[i][1];
                try {
                  mcs_code = mcs_code.trim();
                } catch (err) {
                  mcs_code = String(parseInt(mcs_code)).trim();
                }
                let org_name = data[i][2];
                let area = data[i][4];
                if (mcs_code && org_name && area) {
                    try {
                        timer(1000);
                        let res = {};
                        res = await query_company(org_name, res);
                        res = await query_zu(mcs_code, res);
                        const retval = await query_send_result(res);
                        const ids = await query_areas(area, res);
                        
                        if (retval) {
                            if (retval.includes(ids)) {
                                has_send++;
                                exportText(`已经配送过了，企业：${org_name}，组件编码：${mcs_code}，配送城市：${area}`);
                                continue;
                            } else {
                                res['ids'] = `${ids},${retval}`;
                                res['oldids'] = retval;
                            }
                        } else {
                            res['ids'] = ids;
                            res['oldids'] = null;
                        }
                        
                        const r = await sends(res);
                        if (r === 'ok') {
                            success++;
                            exportText(`配送成功：企业：${org_name}，组件编码：${mcs_code}，配送城市：${area}`);
                        } else {
                            exportText(`配送失败：企业：${org_name}，组件编码：${mcs_code}，配送城市：${area}`);
                            continue;
                        }
                    } catch (error) {
                        exportText(`配送失败：企业：${org_name}，组件编码：${mcs_code}，配送城市：${area}。Error: ${error.stack}`);
                    }
                } else {
                    exportText(`Excel 数据不完整：企业：${org_name}，组件编码：${mcs_code}，配送城市：${area}`);
                }
            }
        }
        exportText(`总数：${total_num}，配送成功：${success}，配送失败：${total_num-success-has_send}，已经配送：${has_send}`);
    } catch (err) {
        exportText(`失败，请重试: ${err.stack}`);
    }
}

window.myExtensionFuncs = {
  startTask190: (data, headers) => startTask190(data, headers)
};
window.postMessage(
  { type: "EXTENSION_READY", funcs: ["startTask190"] }, 
  "*"
);
