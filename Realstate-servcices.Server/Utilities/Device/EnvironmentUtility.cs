using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Realstate_servcices.Server.Utilities.Device
{
    public class EnvironmentUtility
    {
        public string GetCurrentUser()
        {
            return Environment.UserName;
        }

        public string GetUserDomain()
        {
            return Environment.UserDomainName;
        }

        public string GetMachineName()
        {
            return Environment.MachineName;
        }

        public string GetCurrentDirectory()
        {
            return Environment.CurrentDirectory;
        }

        public string GetSystemDrive()
        {
            return Path.GetPathRoot(Environment.SystemDirectory);
        }

        public string GetTempPath()
        {
            return Path.GetTempPath();
        }

        public string GetDesktopPath()
        {
            return Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        }

        public string GetDocumentsPath()
        {
            return Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
        }

        public string GetApplicationDataPath()
        {
            return Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        }

        public string GetLocalApplicationDataPath()
        {
            return Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        }

        public IEnumerable<string> GetLogicalDrives()
        {
            return Environment.GetLogicalDrives();
        }

        public long GetTotalDriveSpace(string drivePath)
        {
            try
            {
                var drive = new DriveInfo(drivePath);
                return drive.TotalSize;
            }
            catch
            {
                return -1;
            }
        }

        public long GetAvailableDriveSpace(string drivePath)
        {
            try
            {
                var drive = new DriveInfo(drivePath);
                return drive.AvailableFreeSpace;
            }
            catch
            {
                return -1;
            }
        }

        public string GetDriveFormat(string drivePath)
        {
            try
            {
                var drive = new DriveInfo(drivePath);
                return drive.DriveFormat;
            }
            catch
            {
                return "Unknown";
            }
        }

        public Dictionary<string, string> GetEnvironmentVariables()
        {
            var envVars = new Dictionary<string, string>();

            foreach (System.Collections.DictionaryEntry de in Environment.GetEnvironmentVariables())
            {
                envVars[de.Key.ToString()] = de.Value.ToString();
            }

            return envVars;
        }

        public string GetEnvironmentVariable(string variableName)
        {
            return Environment.GetEnvironmentVariable(variableName) ?? string.Empty;
        }

        public string GetProcessorCount()
        {
            return Environment.ProcessorCount.ToString();
        }

        public string GetSystemPageSize()
        {
            return Environment.SystemPageSize.ToString();
        }

        public string GetTickCount()
        {
            return Environment.TickCount64.ToString();
        }

        public string GetWorkingSet()
        {
            return Environment.WorkingSet.ToString();
        }

        public bool IsUserInteractive()
        {
            return Environment.UserInteractive;
        }

        public bool HasShutdownStarted()
        {
            return Environment.HasShutdownStarted;
        }

        public string GetCommandLineArgs()
        {
            return string.Join(" ", Environment.GetCommandLineArgs());
        }

        public string GetCurrentProcessPath()
        {
            return Environment.ProcessPath ?? string.Empty;
        }

        public string GetNewLineCharacter()
        {
            return Environment.NewLine;
        }
    }
}