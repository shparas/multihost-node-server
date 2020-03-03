[![Build status](https://dev.azure.com/shparas97/sigmoid-pay-client/_apis/build/status/sigmoid-pay-client-CI)](https://dev.azure.com/shparas97/sigmoid-pay-client/_build/latest?definitionId=4)

# multihost_node_server
[![Build status](https://dev.azure.com/shparas97/sigmoid-pay-client/_apis/build/status/sigmoid-pay-client-CI)](https://dev.azure.com/shparas97/sigmoid-pay-client/_build/latest?definitionId=4)

Multi-host server in node.js using Express

To use:
-------

Clone the project as "git clone https://github.com/shparas/multihost_node_server.git"

Edit app.js for the ssl directories (or set portS = 0 to ignore ssl)

Run "npm install" in the root directories to install required dependencies

Make a copy of new_host directory inside hosts and rename it to the same as the host name. Eg localhost, 127.0.0.1, www.eparas.com, eparas.com, test.eparas.com

Run as "nodemon app.js" or "sudo nodemon app.js"

Cheers!
