import requests
import json

BASE_URL = "https://cardano-mainnet.blockfrost.io/api/v0/pools"
API_KEY = ""  # replace with your API key

headers = {
    "project_id": API_KEY
}

def fetch_pools(page=1, count=100):
    params = {
        "count": count,
        "page": page,
        "order": "asc"
    }

    response = requests.get(BASE_URL, headers=headers, params=params)
    response.raise_for_status()  # raise exception for bad responses

    return response.json()

def fetch_all_pools():
    page = 1
    all_pools = []

    while True:
        current_pools = fetch_pools(page)
        
        # Break loop if no more pools are returned
        if not current_pools:
            break

        all_pools.extend(current_pools)
        page += 1

    return all_pools

def save_to_json(data, filename="pools.json"):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    pools = fetch_all_pools()
    print(f"Total pools fetched: {len(pools)}")

    save_to_json(pools)
    print("Data saved to pools.json")
