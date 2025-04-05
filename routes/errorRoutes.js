// Route to trigger test error
router.get("/trigger-error", (req, res, next) => {
    // Intentionally throw error for testing
    const err = new Error("Intentional 500 Error - Test");
    err.status = 500;
    next(err);
  });