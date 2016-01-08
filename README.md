# refresh-hosts
A tool that update windows hosts file for resolving the hostname correctlly which blocked by Chinese GFW.

## Usage

Notes:
This tool only works in win32 for now.

* pull the code from github and run in nodejs
  
  In win32 command prompt (run as `administrator`):
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

You may need [git](https://git-for-windows.github.io/) and [nodejs](https://nodejs.org/) installed first.