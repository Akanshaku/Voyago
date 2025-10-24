// controllers/socialController.js
module.exports.redirectToSocial = (req, res) => {
  const platform = req.params.platform;
  const profiles = {
    linkedin: "https://www.linkedin.com/in/akanshaku/",
    github: "https://github.com/Akanshaku",
    instagram: "https://www.instagram.com/akanshakumari_03/",
  };

  const redirectUrl = profiles[platform];
  if (redirectUrl) {
    return res.redirect(redirectUrl);
  } else {
    return res.status(404).send("Platform not found");
  }
};
