const searchTracks = async (query: string, accessToken: string) => {
  // track / album 등 선택할 수 있게 하기 !!
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

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

  const trackList = data.tracks.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    album: item.album.name,
    artist: item.artists.map((artist: any) => artist.name).join(", "),
    albumCover: item.album.images[0].url,
    duration: new Date(item.duration_ms).toISOString().substr(14, 5),
  }));
  //   console.log(trackList);

  return trackList;
};

export default searchTracks;
