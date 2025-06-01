# Freebid
## About
Freebid is a software born in 2022, its sole and main purpose is to automate the process of collecting bids on the popular bidoo.com auction site. I specify that there is no connection between the business of freebid and that of bidoo. I decided to release this latest version open source and free for all, which saves user data only locally, with updated functionality, and available for all major operating systems. If you find the project interesting and useful, don't forget to leave a star ⭐.
## Installation 
### Important
If you will not be using the portable version of the software you should know that among the dependencies of freebid is node-gyp which requires some prerequisites to be installed properly, you can find all the useful information [here](https://github.com/nodejs/node-gyp).
Also if you get any errors when starting the program I recommend removing spaces from any folder names included in the program directory.
### Windows (tested)
On Windows you can use a portable version that is packaged as an archive (easiest way):
- link to archive

Or clone the repository and launch the program with following commands:
- `git clone pysol0/Freebid`
- `npm install`
- `npm run start`
You will also need a chrome installation, and to add its path in variable `main.js` -> `const chrome_path = ""` 

### MacOS (tested)
On MacOS you can only clone the repository and run the same commands that you would run on Windows
### Linux (not tested, should work fine)
On Linux you can only clone the repository and run the same commands that you would run on Windows
## Getting started
The first time you launch Freebid it will ask you to enter an api Id and api Hash, underneath there will be a link to the page to get them, you will need a telegram account( short video tutorial [here](https://www.youtube.com/watch?v=tzYTLjdr7rI) ). 
After that Freebid will close itself, once restarted if the data you entered were correct, it will ask you to login with telegram via qrcode. Once that is done you will be on the home screen of the software.
Initially there will be two things to do to start using the program:
- add at least one account 
- by accessing the settings from the bottom right button, select one or more channels from which to extract bids links

You can now start exploring all the features of Freebid.
## Some notes
- When selecting channels, it is recommended to enter only those where only bids links are posted; the program incorporates a filtering system, but you may run into bugs
- Freebid also supports Spanish accounts, you can add them like everyone else
- When you set automatic collection with time interval, the program must remain open

## Further information
Freebid is now completely open source, which implies that if you have any changes, improvements or bug fixes to propose they are greatly appreciated. If you have a problem you can report it in the issues and I along with the community will try to help you. Enjoy using Freebid!

Icons and animations by [Icons8](https://icons8.com/) and [LottieFiles](https://lottiefiles.com/free-animations/free).
