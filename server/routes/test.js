const testRoute = (req, res) => {
  res.status(200).json({
    message: "CineAI Backend Running"
  });
};

export default testRoute;
