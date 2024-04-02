const manual_delay = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export default manual_delay;
