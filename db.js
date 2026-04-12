const Sequelize = require('sequelize')
const sequelize = new Sequelize('mysql://root:NMVuCXlSzwfmBHMhYUEMhUoDjawlMwqv@metro.proxy.rlwy.net:23162/railway', 
    {
    dialect: 'mysql',
    logging: false 
    }
);


    module.exports = 
    {
        Sequelize: Sequelize,
        sequelize: sequelize
    }