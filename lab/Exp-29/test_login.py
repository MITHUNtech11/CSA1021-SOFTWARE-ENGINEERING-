from login import authenticate_user

def test_valid_login():
    res = authenticate_user('mithun@simats.edu', 'password')
    assert res['success'] is True
    assert 'token' in res

def test_invalid_login():
    res = authenticate_user('mithun@simats.edu', 'wrongpwd')
    assert res['success'] is False
