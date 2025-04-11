// import { DataTypes } from "sequelize";

// export async function up(context: any) {
//   const queryInterface = context.context;
//   await queryInterface.createTable("Contacts", {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     phoneNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     linkedId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       references: {
//         model: "Contacts",
//         key: "id",
//       },
//     },
//     linkPrecedence: {
//       type: DataTypes.ENUM("primary", "secondary"),
//       allowNull: false,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     deletedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//   });

//   await queryInterface.addIndex("Contacts", ["phoneNumber"]);
//   await queryInterface.addIndex("Contacts", ["email"]);
// }

// export async function down(context: any) {
//   const queryInterface = context.context;
//   await queryInterface.dropTable("Contacts");
// }

import { DataTypes, Sequelize } from "sequelize";

export async function up(context: any) {
  const queryInterface = context;

  // Check if table exists
  const [tables] = await queryInterface.sequelize.query(
    "SHOW TABLES LIKE 'Contacts'"
  );

  if (tables.length === 0) {
    await queryInterface.createTable("Contacts", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Contacts",
          key: "id",
        },
      },
      linkPrecedence: {
        type: DataTypes.ENUM("primary", "secondary"),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    // Add indexes only if we created the table
    try {
      await queryInterface.addIndex("Contacts", ["phoneNumber"], {
        name: "contacts_phone_number",
      });
    } catch (error) {
      console.log("Phone number index may already exist, continuing...");
    }

    try {
      await queryInterface.addIndex("Contacts", ["email"], {
        name: "contacts_email",
      });
    } catch (error) {
      console.log("Email index may already exist, continuing...");
    }
  }
}

export async function down(context: any) {
  const queryInterface = context;
  await queryInterface.dropTable("Contacts");
}
