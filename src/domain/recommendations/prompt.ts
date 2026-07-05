import type { AnalysisResult } from "@/domain/analysis";
import type { ListeningProfile } from "@/domain/profile/listening-profile";
import type { DiscoveryScoreViewModel } from "@/domain/scoring";

function list(items: string[], fallback = "None") {
  return items.length > 0 ? items.join(", ") : fallback;
}

export function buildRecommendationPrompt({
  profile,
  analysis,
  discoveryScore,
  excludedRecommendationNames = [],
}: {
  profile: ListeningProfile;
  analysis: AnalysisResult;
  discoveryScore: DiscoveryScoreViewModel;
  excludedRecommendationNames?: string[];
}) {
  const topArtists = profile.topArtists.slice(0, 8).map((artist) => artist.name);
  const topGenres = analysis.genreDiversity.topGenres.slice(0, 6).map((genre) => genre.genre);
  const recentTracks = profile.recentlyPlayed
    .slice(0, 10)
    .map((track) => `${track.title} by ${track.artistNames.join(", ")}`);
  const topTracks = profile.topTracks
    .slice(0, 10)
    .map((track) => `${track.title} by ${track.artistNames.join(", ")}`);

  return `
Generate exactly 5 personalized music recommendations for a Spotify listener.

Use this listening profile:
- Top artists: ${list(topArtists)}
- Top genres: ${list(topGenres)}
- Top tracks: ${list(topTracks)}
- Recently played: ${list(recentTracks)}
- Discovery Score: ${discoveryScore.score}/100 (${discoveryScore.band})
- Exploration level: ${analysis.explorationLevel}
- Repeat listening: ${analysis.repeatListening.repeatPercentage}%
- Top-three artist concentration: ${analysis.artistConcentration.topThreeArtistShare}%
- Previously shown recommendations to avoid: ${list(excludedRecommendationNames)}

Recommendation strategy:
- Stay relevant to the listener's current taste.
- Avoid recommending the same top tracks listed above.
- Include at least 2 recommendations that gently expand beyond the dominant genres.
- Each explanation must be transparent and specific to the listener's profile.

Return ONLY valid JSON in this exact shape:
{
  "recommendations": [
    {
      "songTitle": "Song title",
      "artist": "Artist name",
      "genre": "Genre",
      "explanation": "Why this was recommended based on the listener profile."
    }
  ]
}
`;
}

export function buildSurprisePrompt({
  profile,
  analysis,
  discoveryScore,
}: {
  profile: ListeningProfile;
  analysis: AnalysisResult;
  discoveryScore: DiscoveryScoreViewModel;
}) {
  const topArtists = profile.topArtists.slice(0, 8).map((artist) => artist.name);
  const topGenres = analysis.genreDiversity.topGenres.slice(0, 6).map((genre) => genre.genre);
  const recentTracks = profile.recentlyPlayed
    .slice(0, 10)
    .map((track) => `${track.title} by ${track.artistNames.join(", ")}`);

  return `
Generate exactly one "Surprise Me" recommendation for a Spotify listener.

User profile:
- Top artists: ${list(topArtists)}
- Top genres: ${list(topGenres)}
- Recently played: ${list(recentTracks)}
- Discovery Score: ${discoveryScore.score}/100 (${discoveryScore.band})
- Exploration level: ${analysis.explorationLevel}
- Repeat listening: ${analysis.repeatListening.repeatPercentage}%

Surprise strategy:
- Pick something intentionally outside the user's normal listening habits.
- It must still be likely to appeal based on melody, mood, instrumentation, or vocal style.
- Do not recommend tracks already present in the user's recent or top tracks.
- Choose one exploration level: "Safe Discovery", "Moderate Stretch", or "Bold Discovery".

Return ONLY valid JSON in this exact shape:
{
  "recommendation": {
    "songTitle": "Song title",
    "artist": "Artist name",
    "genre": "Genre",
    "whySurprising": "Why this is outside the user's usual listening.",
    "whyUserMayEnjoyIt": "Why the user may still enjoy it.",
    "explorationLevel": "Safe Discovery"
  }
}
`;
}
