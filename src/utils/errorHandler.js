
//  Un-expected errors come from any part of router.
export const asyncHandler = (API) => {
    return (req, res, next) => {

        // call function 
        API(req, res, next)
            .catch(async (err) => {
                console.log(err)
                if (req.failedDocument) {
                    const { model, _id } = failedDocument
                    await model.findByIdAndDelete(_id)
                }
                res.status(500).json({ message: "Failed" })
            })


    }
}

export const globalResponse = (err, req, res, next) => {
    if (err) {
        if (req.validationErrorArr) {
            return res
                .status(err['cause'] || 400)
                .json({ message: req.validationErrorArr })
        }

        return res
            .status(err['cause'] || 500)
            .json({ message: err.message })
    }
}