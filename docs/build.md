# Build instructions

I left almost all steps prepared as package scripts for a smooth build process, if you have NodeJS 25.5+ with SEA module support please follow the first steps.
Note: the build process is currently only in mind for Windows.

## Build with Node 25.5+ (with SEA module support)

With this steps the final .exe fill will have aprox ~15MB extra than the other build process due SEA module still in development.

## Build with Node without SEA full module support

To follow this path you need previously install postject with:

```
npm install -d postject
```

Then you can run the following steps:

1. Use the `build:partial` script to compile the initial files:

   ```
   npm run build:partial
   ```

2. Run the following command to create the blob file from the generated `server.js`:

   ```
   node --experimental-sea-config build/sea-config.json
   ```

3. Copy the node.exe from your Node installation to create the new .exe file:

   ```
   Copy-Item (Get-Command node).Source -Destination build\ableton-control.exe
   ```

4. Remove the windows sign with Windows SDK tool `signtool` (you can install the Windows 10 SDK from https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk/):

   ```
   signtool remove /s build\ableton-control.exe
   ```

   Note: If the signtool command is not found, you can run the same comand in CMD (NOT PowerShell) with the full path to signtool.exe, for example:

   ```
   "C:\Program Files (x86)\Windows Kits\10\bin\10.0.28000.0\x64\signtool.exe" remove /s build\ableton-control.exe
   ```

5. Inyect the blob file into the .exe with the following command:

   ```
   npx postject build\ableton-control.exe NODE_SEA_BLOB build\sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
   ```
