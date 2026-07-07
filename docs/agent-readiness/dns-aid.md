# DNS for AI Discovery (DNS-AID)

Publish the DNS-AID entrypoint records below in the public `novita.ai` DNS zone. These records point validating agents to the well-known discovery documents already served by `novita-home`.

DNS-AID is currently based on `draft-mozleywilliams-dnsop-dnsaid-02`, so some SVCB parameter names may need adjustment if the draft changes or the DNS provider only supports numeric/private SvcParamKey syntax. The `endpoint` parameter is included for compatibility with current agent-readiness scanners; `well-known` and `cap` align with the current DNS-AID draft.

## Records

Preferred SVCB records:

```dns
_index._agents.novita.ai. 3600 IN SVCB 1 novita.ai. alpn=h2,h3 port=443 endpoint=https://novita.ai/.well-known/agent-index.json well-known=agent-index.json cap=https://novita.ai/.well-known/agent-skills/index.json
_a2a._agents.novita.ai.  3600 IN SVCB 1 novita.ai. alpn=h2,h3,a2a port=443 endpoint=https://novita.ai/.well-known/agent-card.json well-known=agent-card.json cap=https://novita.ai/.well-known/agent-card.json
_mcp._agents.novita.ai.  3600 IN SVCB 1 novita.ai. alpn=h2,h3,mcp port=443 endpoint=https://novita.ai/.well-known/mcp.json well-known=mcp.json cap=https://novita.ai/.well-known/mcp.json
```

If the DNS provider supports only HTTPS records for ServiceMode publishing, mirror the same parameters with type `HTTPS`:

```dns
_index._agents.novita.ai. 3600 IN HTTPS 1 novita.ai. alpn=h2,h3 port=443 endpoint=https://novita.ai/.well-known/agent-index.json well-known=agent-index.json cap=https://novita.ai/.well-known/agent-skills/index.json
_a2a._agents.novita.ai.  3600 IN HTTPS 1 novita.ai. alpn=h2,h3,a2a port=443 endpoint=https://novita.ai/.well-known/agent-card.json well-known=agent-card.json cap=https://novita.ai/.well-known/agent-card.json
_mcp._agents.novita.ai.  3600 IN HTTPS 1 novita.ai. alpn=h2,h3,mcp port=443 endpoint=https://novita.ai/.well-known/mcp.json well-known=mcp.json cap=https://novita.ai/.well-known/mcp.json
```

## DNSSEC

Enable DNSSEC signing for the hosted `novita.ai` zone and publish the generated DS record at the `.ai` registrar. The DNS-AID check expects validating resolvers to receive authenticated data for the discovery names.

## Verification

After propagation, verify the records from a resolver that supports SVCB/HTTPS:

```sh
dig SVCB _index._agents.novita.ai
dig SVCB _a2a._agents.novita.ai
dig SVCB _mcp._agents.novita.ai
dig +dnssec SVCB _index._agents.novita.ai
dig DS novita.ai
```

Expected result:

- `_index._agents.novita.ai` returns a ServiceMode SVCB or HTTPS record pointing at `novita.ai`.
- `_a2a._agents.novita.ai` points to `/.well-known/agent-card.json`.
- `_mcp._agents.novita.ai` points to `/.well-known/mcp.json`.
- `dig DS novita.ai` returns at least one DS record after DNSSEC is delegated.
