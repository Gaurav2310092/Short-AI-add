const protect = (req, res, next) => {
    try {

        const { userId } = req.auth();   // call the function

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // attach clerkId to request
        req.clerkId = userId;

        next();

    } catch (error) {

        return res.status(401).json({
            message: error.message
        });

    }
};

module.exports = { protect };