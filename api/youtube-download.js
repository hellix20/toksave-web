const ytdl = require('ytdl-core');

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    if (!ytdl.validateURL(url)) {
        throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Cari format MP4 terbaik yang ada video dan audionya
    const formats = info.formats.filter(f => f.container === 'mp4' && f.hasVideo && f.hasAudio);
    
    if (!formats.length) {
        throw new Error('Tidak dapat menemukan format MP4 yang sesuai.');
    }

    const bestFormat = ytdl.chooseFormat(formats, { quality: 'highestvideo' });

    // Kirim data kembali ke web lu
    res.status(200).json({
      success: true,
      data: {
        title: videoDetails.title,
        thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
        downloadUrl: bestFormat.url,
        quality: bestFormat.qualityLabel
      }
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
