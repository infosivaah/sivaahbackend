const express =
  require("express");

const router =
  express.Router();

const mongoose =
  require("mongoose");

/* GET CERTIFICATE */

router.get(
  "/:slug",

  async (req, res) => {

    try {

      const db =
        mongoose.connection.db;

      const certificate =
        await db
          .collection(
            "certificates"
          )
          .findOne({

            slug:
              req.params.slug,
          });

      if (!certificate) {

        return res
          .status(404)
          .json({

            success: false,
          });
      }

      res.json({

        success: true,

        data:
          certificate,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,
      });
    }
  }
);

module.exports =
  router;