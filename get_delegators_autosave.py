import requests
import json
import time

BASE_URL = "https://cardano-mainnet.blockfrost.io/api/v0/pools"
API_KEYS = ["","", "",""]  # Add your API keys here
DELEGATORS_ENDPOINT = "{}/delegators"
POOLS_FILE = "pools.json"
DELEGATORS_FILE = "delegators.json"
INDEX_FILE = "index.json"

headers = {
    "project_id": API_KEYS[0]
}

def update_api_key():
    if API_KEYS:
        headers["project_id"] = API_KEYS.pop(0)
    else:
        raise RuntimeError("No more API keys available")

def fetch_delegators(pool_id, page=1, count=100):
    url = DELEGATORS_ENDPOINT.format(BASE_URL + "/" + pool_id)
    params = {
        "count": count,
        "page": page,
        "order": "asc"
    }

    for _ in range(2):  # Try twice
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()  # raise exception for bad responses
            return response.json()
        except requests.RequestException:
            print("Request failed. Retrying...")
            time.sleep(5)  # A short delay before retry
            update_api_key()

    return []

def fetch_all_delegators_for_pool(pool_id):
    page = 1
    all_delegators = []

    while True:
        current_delegators = fetch_delegators(pool_id, page)
        
        if not current_delegators:
            break

        all_delegators.extend(current_delegators)
        page += 1

    return all_delegators

def save_index(idx):
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump({"last_processed": idx}, f)

def fetch_all_delegators_for_pool(pool_id):
    page = 1
    all_delegators = []

    while True:
        current_delegators = fetch_delegators(pool_id, page)
        
        if not current_delegators:
            break

        # Filter delegators with live_stake greater than 10 million
        filtered_delegators = [d for d in current_delegators if int(d.get("live_stake", 0)) >= 10000000]

        all_delegators.extend(filtered_delegators)
        page += 1

    return all_delegators

def append_to_json(data):
    # Load existing data
    try:
        with open(DELEGATORS_FILE, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        existing_data = []

    # Combine existing data with new data
    combined_data = existing_data + data

    # Write combined data back to the file
    with open(DELEGATORS_FILE, 'w', encoding='utf-8') as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=4)



if __name__ == "__main__":
    with open(POOLS_FILE, 'r', encoding='utf-8') as f:
        pool_ids = json.load(f)
    try:
        with open(INDEX_FILE, 'r', encoding='utf-8') as f:
            # Check if the file is empty
            content = f.read().strip()
            if content:
                start_idx = json.loads(content).get("last_processed", 0)
            else:
                start_idx = 0
    except FileNotFoundError:
        start_idx = 0

    for idx, pool_id in enumerate(pool_ids[start_idx:], start=start_idx):
        delegators = fetch_all_delegators_for_pool(pool_id)
        append_to_json(delegators)

        print(f"Fetched {len(delegators)} delegators for pool: {pool_id}")
        save_index(idx + 1)  # Save the index of the next pool to be processed
    
        # Read the JSON file
    with open("delegators.json", "r") as file:
        delegators = json.load(file)

    # Convert the live_stake from string to int and sort by live_stake
    delegators_sorted = sorted(delegators, key=lambda x: int(x["live_stake"]), reverse=True)

    # Add a rank to each delegator
    for index, delegator in enumerate(delegators_sorted, start=1):
        delegator["rank"] = index

    # Write the updated delegators back to the JSON file
    with open("delegators.json", "w") as file:
        json.dump(delegators_sorted, file, indent=4)

    print("Delegators sorted and ranked successfully!")

