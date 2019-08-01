import hashlib
import requests
import time
import uuid

import sys


def valid_proof(last_proof, proof, difficulty):
    guess = f'{last_proof}{proof}'.encode()
    guess_hash = hashlib.sha256(guess).hexdigest()
    return guess_hash[:difficulty] == '0' * difficulty

def proof_of_work(last_proof, difficulty):
    proof = 1000000
    while valid_proof(last_proof, proof, difficulty) is False:
        proof += 1

    return proof

def fetch_last_proof():
    URL = 'https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof'
    headers = {
        "Authorization": "Token 80bd0d5dc2befdd2bb01d014daeb9b1780c36cf2"
    }
    response = requests.get(url = URL, headers = headers)
    data = response.json()
    return data

def mine_block(proof, start_time, cooldown):
    URL = 'https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/'
    request = {
        "proof": proof
    }
    headers = {
        "Authorization": "Token 80bd0d5dc2befdd2bb01d014daeb9b1780c36cf2"
    }
    while True:
        if time.time() - start_time >= cooldown:
            response = requests.post(url = URL, json = request, headers = headers)
            print(response.json(), '<----response')
            return response.json()
        else:
            print("waiting for cooldown")

if __name__ == '__main__':
    # What node are we interacting with?
    if len(sys.argv) > 1:
        node = sys.argv[1]
    else:
        node = "https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/"

    coins_mined = 0
    # unique_id = get_uuid()
    # Run forever until interrupted
    while True:
        data = fetch_last_proof()
        last_proof = data["proof"]
        difficulty = data["difficulty"]
        cooldown = data["cooldown"]
        print("Calculating proof")
        start_time = time.time()
        proof = proof_of_work(last_proof, difficulty)
        end_time = time.time()
        time_elapsed = end_time - start_time
        print(f"Proof calculated in {time_elapsed} seconds.")
        response = mine_block(proof, start_time, cooldown)
        if response:
            if response["messages"][0] == 'New Block Forged':
                coins_mined += 1
                print(response["message"])
                print(f'{coins_mined} coins mined.')
            else:
                print(response["message"])
        else:
            print("POST request failed.")
