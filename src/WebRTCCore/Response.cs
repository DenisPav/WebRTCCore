namespace WebRTCCore
{
    public class Response
    {
        public string Id { get; set; }
        public SdpObject Sdp { get; set; }
        public Ice Ice { get; set; }
        public string Status { get; set; }
    }

    public class Ice
    {
        public string Candidate { get; set; }
        public string SdpMid { get; set; }
        public int SdpMLineIndex { get; set; }
    }

    public class SdpObject
    {
        public string Type { get; set; }
        public string Sdp { get; set; }
    }
}
