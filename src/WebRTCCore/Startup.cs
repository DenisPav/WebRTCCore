using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using WebRTCCore.Middleware;

namespace WebRTCCore
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services) { }

        public void Configure(IApplicationBuilder app)
        {
            JsonConvert.DefaultSettings = () => new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };

            app.UseWebSockets();

            app.UseMiddleware(typeof(WebsocketMiddleware));

            app.UseDefaultFiles();

            app.UseStaticFiles();
        }
    }
}
