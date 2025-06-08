export default function handler(req, res) {
  const { categoryName } = req.query;

  if (!categoryName) {
    return res.status(400).json({ success: false, message: 'Missing category name' });
  }

  const fileName = `icon_${categoryName.toLowerCase().replace(/\s/g, '_')}.png`;
  return res.status(200).json({ iconFile: fileName });
}
