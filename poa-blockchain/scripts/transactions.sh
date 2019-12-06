# echo "sending money"

# curl --data '{"jsonrpc":"2.0","method":"personal_sendTransaction","params":[{"from":"0x82f876d4bbb1b017e0d730f12d9721e0a2b1fe16","to":"0x004ec07d2329997267ec62b4166639513386f32e","value":"0xde0b6b3a7640000"}, "vupUEh2H7fKQiZ"],"id":0}' -H "Content-Type: application/json" -X POST localhost:7010


# ./get-balance.sh auth1 7011


echo "sending money"

curl --data '{"jsonrpc":"2.0","method":"personal_sendTransaction","params":[{"from":"0x98b32c998f16e36cff94b430c656335d682e78dd","to":"0x82f876d4bbb1b017e0d730f12d9721e0a2b1fe16","value":"0xde0b6b3a7640000"}, "NA5J5Ztikxis6Q"],"id":0}' -H "Content-Type: application/json" -X POST localhost:7011


./get-balance.sh auth2 7010