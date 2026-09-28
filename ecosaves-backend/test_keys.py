import time
import requests
import hashlib
from app.core.config import settings

def sha512(value: str) -> str:
    return hashlib.sha512(value.encode("utf-8")).hexdigest()

subscription_key = "4168bf54c65a4c35b3ad7cd5eeddaee6"

client_ids = ["CL001", "ecosaves", "ECOSAVES", "CL0001", "ECOBANK"]
source_codes = ["CORP_CIB_MOBILE", "ECOSAVES", "WEB", "MOBILE"]
affiliate_codes = ["ENG", "EGH"]

url = "https://artxuat.ecobank.com/corp-api/services/api/v2/integration/auth/app/token"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Ocp-Apim-Subscription-Key": subscription_key,
    "User-Agent": "Mozilla/5.0",
}

print("--- TESTING ECOBANK SANDBOX KEY COMBINATIONS ---")

for client_id in client_ids:
    for source_code in source_codes:
        for aff in affiliate_codes:
            req_id = f"REQ{int(time.time())}"
            req_type = "GET_API_TOKEN"
            service_code = "ACCOUNT_SERVICE"

            # Try subscription_key as secret_key
            secret_key = subscription_key
            public_key = subscription_key

            token_str = client_id + aff + source_code + req_id + req_type + "127.0.0.1" + secret_key
            req_token = sha512(token_str)

            hash_str = client_id + aff + source_code + req_id + req_type + "127.0.0.1" + req_token + service_code + secret_key
            sec_hash = sha512(hash_str)

            body = {
                "headerRequest": {
                    "affiliateCode": aff,
                    "clientId": client_id,
                    "sourceCode": source_code,
                    "requestId": req_id,
                    "ipAddress": "127.0.0.1",
                    "requestType": req_type,
                    "requestToken": req_token,
                },
                "publicKey": public_key,
                "serviceCode": service_code,
                "secureHash": sec_hash,
            }

            try:
                res = requests.post(url, json=body, headers=headers, timeout=5)
                data = res.json()
                h_res = data.get("headerResponse", {})
                code = h_res.get("responseCode")
                desc = h_res.get("responseDesc")
                print(f"Testing client_id={client_id}, source={source_code}, aff={aff} -> Code: {code}, Desc: {desc}")
                if code == "000":
                    print("\n🎉 MATCH FOUND!")
                    print(f"CLIENT_ID: {client_id}")
                    print(f"SOURCE_CODE: {source_code}")
                    print(f"AFFILIATE: {aff}")
                    print(f"FULL RESPONSE: {data}")
                    break
            except Exception as e:
                pass
