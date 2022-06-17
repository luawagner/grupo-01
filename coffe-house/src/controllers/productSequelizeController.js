
const db = require("../database/models");

const { Op } = require("sequelize");


const Products = db.Products;
const GrindsProducts = db.GrindsProducts;
const WeightProducts = db.WeightProducts;
const Grind = db.Grinds;
const Weight = db.Weight;
const ProductCategory = db.ProductCategories;

const productSequelizeController = {
  list: async (req, res) => {
    const products = await Products.findAll({
      include: [
        {
          association: "productCategory",
        },
      ],
    });

    const blonde = products.filter((p) => p.productCategory.type == "Blonde");
    const medium = products.filter((p) => p.productCategory.type == "Medium");
    const dark = products.filter((p) => p.productCategory.type == "Dark");

    res.render("products/products-index", {
      blonde: blonde,
      medium: medium,
      dark: dark,
    });
  },

  create: async (req, res) => {
    try {
      const [weight, grinds, productCategory] = await Promise.all([
        Weight.findAll(),
        Grind.findAll(),
        ProductCategory.findAll(),
      ]);
      res.render("products/product-create", {
        weight: weight,
        grinds: grinds,
        productCategory: productCategory,
      });
    } catch (err) {
      console.log(err);
    }
  },

  store: async (req, res) => {
    try {
      const newProduct = await Products.create({
        name: req.body.name,
        region: req.body.region,
        description: req.body.description,
        image: req.file.filename,
        price: req.body.price,
        stock: req.body.stock,
        category_id: req.body.category,
      });

      const grinds = req.body.grind;
      if (grinds.length > 1) {
        grinds.forEach((grind) => {
          GrindsProducts.create({
            id_grind: grind,
            id_product: newProduct.id,
          });
        });
      } else {
        GrindsProducts.create({
          id_grind: req.body.grind,
          id_product: newProduct.id,
        });
      }

      const weight = req.body.weight;
      if (weight.length > 1) {
        weight.forEach((weightid) => {
          WeightProducts.create({
            id_weight: weightid,
            id_product: newProduct.id,
          });
        });
      } else {
        WeightProducts.create({
          id_weight: req.body.weight,
          id_product: newProduct.id,
        });
      }

      res.redirect("/product");
    } catch (err) {
      console.log(err);
    }
  },

  product: async (req, res) => {
    
      try {
        const product = await Products.findByPk(req.params.id,
          { include: [
            {all: true}]
          });

        res.render("products/product-detail", {
          product
        });
      } catch (err) {
        console.error(err);
        res.render("/views/error");
      }
    
  },
};

module.exports = productSequelizeController
