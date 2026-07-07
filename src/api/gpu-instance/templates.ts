import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

// get official template list by params
export function reqGetOfficialTemplates(params: any) {
  return request({
    url: "/official/templates",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
// get template list by params
export function reqGetTemplates(params: any) {
  return request({
    url: "/templates",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
// get template by templateId
export function reqGetTemplateById(templateId: string) {
  return request({
    url: "/template/" + templateId,
    method: "GET",
    base_url: BASE_API_URL,
  });
}
// get template by templateId
export function reqGetUnPrivateTemplateById(templateId: string) {
  return request({
    url: "/template/" + templateId + "?isCommunity=true",
    method: "GET",
    base_url: BASE_API_URL,
  });
}
// get template by templateId
export function reqGetOfficialTemplateById(templateId: string) {
  return request({
    url: "/official/template/" + templateId + "?isCommunity=true",
    method: "GET",
    base_url: BASE_API_URL,
  }).catch((err: any) => {
    if (
      err?.reason === "TEMPLATE_NOT_FOUND" ||
      err?.reason === "RESOURCE_NOT_FOUND"
    ) {
      return Promise.resolve({ template: null });
    }
  });
}
// delete template by templateId
export function reqDeleteTemplate(templateId: string) {
  return request({
    url: "/template/" + templateId,
    method: "DELETE",
    base_url: BASE_API_URL,
  });
}
// update template
export function reqUpdateTemplate(params: any) {
  return request({
    url: "/template",
    method: "PUT",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// add template
export function reqAddTemplate(params: any) {
  return request({
    url: "/template",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// complaint template
export function reqComplaintTemplate(params: any) {
  return request({
    url: "/template/complaint",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// operate template - fav, un-fav, share
export function reqOperateTemplate(params: any) {
  return request({
    url: "/template/operate",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// storage local free
export function reqStorageLocalFree() {
  return request({
    url: "/gpu/storage/local/free",
    method: "GET",
    base_url: BASE_API_URL,
  });
}
