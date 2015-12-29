SET TOKEN_FILE_NAME=token
SET NODE_LIST_FILE_NAME=nodesList
SET PLAYER_LIST_FILE_NAME=playerList
SET INPUT_FILE_NAME=input.txt
SET API_SERVER_HTTPS=0;
SET API_SERVER=api.app
SET API_KEY=2683567003
SET API_SECRET=a27624468a30e220076cb5c3d037c420

del %TOKEN_FILE_NAME%
del %NODE_LIST_FILE_NAME%
del %PLAYER_LIST_FILE_NAME%

node getToken.js >> %TOKEN_FILE_NAME%
node getNodes.js >> %NODE_LIST_FILE_NAME%
node getPlayers.js >> %PLAYER_LIST_FILE_NAME%
node parseData.js