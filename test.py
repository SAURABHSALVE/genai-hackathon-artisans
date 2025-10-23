import jwt
import datetime

payload = {
    "user_id": 1,  # replace with actual user id if needed
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
}

token = jwt.encode(payload, "2ae74a149f3221dd1cb16baa3c13ceb10066845882f302adfb56c3556fd38618", algorithm="HS256")
print(token)
