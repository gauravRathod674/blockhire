#!/usr/bin/env python3

import requests
import json

# Test API endpoints
API_BASE = "http://127.0.0.1:8000"

def test_registration():
    """Test the registration endpoint"""
    url = f"{API_BASE}/api/auth/register/"
    data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Registration Test:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Registration Error: {e}")
        return None

def test_login():
    """Test the login endpoint"""
    url = f"{API_BASE}/api/auth/login/"
    data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"\nLogin Test:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        print(f"Cookies: {response.cookies}")
        return response if response.status_code == 200 else None
    except Exception as e:
        print(f"Login Error: {e}")
        return None

def test_profile_access(session=None):
    """Test the profile endpoint"""
    url = f"{API_BASE}/api/profile/"
    
    try:
        if session:
            response = session.get(url)
        else:
            response = requests.get(url)
        print(f"\nProfile Test:")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Profile Error: {e}")

if __name__ == "__main__":
    print("Testing Django API endpoints...")
    
    # Test registration
    reg_result = test_registration()
    
    # Test login
    login_response = test_login()
    
    # Test profile access with session cookies
    if login_response:
        session = requests.Session()
        session.cookies.update(login_response.cookies)
        test_profile_access(session)
    else:
        test_profile_access()
    
    print("\nAPI tests completed!")