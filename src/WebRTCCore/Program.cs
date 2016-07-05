using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace WebRTCCore
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel(opts =>
                {
                    //opts.UseHttps("./cert.pfx", "123456");
                })
                //.UseUrls("https://192.168.1.234")
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
