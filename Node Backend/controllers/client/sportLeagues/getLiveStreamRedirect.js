const { getGLiveStream } = require("../../../config/sportsAPI");

async function handler(req, res) {
  try {
    const { matchId } = req.params;
    console.log(`=== [Redirect] getLiveStreamRedirect matchId=${matchId}`);
    
    if (!matchId) {
      return res.status(400).send("Match ID is required");
    }

    const result = await getGLiveStream(matchId);
    const streamUrl = result?.data?.streamUrl;

    if (streamUrl) {
      console.log(`=== [Redirect] Success! Redirecting to: ${streamUrl}`);
      return res.redirect(streamUrl);
    } else {
      console.error(`=== [Redirect] Failed to get streamUrl for matchId=${matchId}`);
      return res.status(404).send("Stream not found or expired");
    }
  } catch (error) {
    console.error("=== [Redirect] Error :: ", error?.message);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  handler
};
