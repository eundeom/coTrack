const getTrack = async (songIds: string, accessToken: string | null) => {
  const url = `https://api.spotify.com/v1/tracks?ids=${encodeURIComponent(songIds)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  if (!res.ok) {
    console.error("Error", res.status);
  }

  const data = await res.json();
  console.log(data);

  const playlist_list = data.tracks.map((item: any) => ({
    id: item.id,
    name: item.name,
    album: item.album.name,
    artist: item.artists.map((artist: any) => artist.name).join(", "),
    albumCover: item.album.images[0].url,
    duration: new Date(item.duration_ms).toISOString().substr(14, 5),
  }));

  console.log("l", playlist_list);

  return playlist_list;
};

export default getTrack;
