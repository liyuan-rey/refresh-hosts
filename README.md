# refresh-hosts
A tool that update windows hosts file for resolving the hostname which blocked by Chinese GFW.

## Usage

Notes:
This tool only works in win32 for now.

* pull the code from github and run in node
  
  In win32 command prompt(wit git and node installed):
  ```cmd
  %HOMEDRIVE%
  cd %HOMEPATH%
  mkdir refresh-hosts
  cd refresh-hosts
  git init
  git pull https://github.com/liyuan-rey/refresh-hosts.git
  npm install
  node index.js
  ```
