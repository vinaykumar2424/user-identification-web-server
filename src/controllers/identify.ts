import { Request, Response } from "express";
import Contact from "../models/Contact";
import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/database";

async function identify(req: Request, res: Response) {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res
      .status(400)
      .json({ error: "Either email or phoneNumber must be provided" });
  }

  try {
    const result = await sequelize.transaction(async (t: Transaction) => {
      const whereClause: any = {
        deletedAt: null,
        [Op.or]: [],
      };
      if (email) whereClause[Op.or].push({ email });
      if (phoneNumber) whereClause[Op.or].push({ phoneNumber });

      const matchingContacts = await Contact.findAll({
        where: whereClause,
        transaction: t,
      });

      if (matchingContacts.length === 0) {
        const newPrimary = await Contact.create(
          {
            email,
            phoneNumber,
            linkedId: null,
            linkPrecedence: "primary",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction: t }
        );

        return {
          primaryContactId: newPrimary.id,
          emails: newPrimary.email ? [newPrimary.email] : [],
          phoneNumbers: newPrimary.phoneNumber ? [newPrimary.phoneNumber] : [],
          secondaryContactIds: [],
        };
      }

      const primaryContacts: Contact[] = [];
      const primaryIds = new Set<number>();

      for (const contact of matchingContacts) {
        let primary = contact;
        if (contact.linkPrecedence === "secondary") {
          const linkedPrimary = await Contact.findByPk(contact.linkedId!, {
            transaction: t,
          });
          if (!linkedPrimary) throw new Error("Invalid linkedId");
          primary = linkedPrimary;
        }
        if (!primaryIds.has(primary.id)) {
          primaryIds.add(primary.id);
          primaryContacts.push(primary);
        }
      }

      primaryContacts.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const mainPrimary = primaryContacts[0];
      const otherPrimaries = primaryContacts.slice(1);

      for (const primary of otherPrimaries) {
        await Contact.update(
          {
            linkPrecedence: "secondary",
            linkedId: mainPrimary.id,
            updatedAt: new Date(),
          },
          {
            where: { id: primary.id },
            transaction: t,
          }
        );

        await Contact.update(
          {
            linkedId: mainPrimary.id,
            updatedAt: new Date(),
          },
          {
            where: { linkedId: primary.id },
            transaction: t,
          }
        );
      }

      const mainGroupContacts = await Contact.findAll({
        where: {
          [Op.or]: [{ id: mainPrimary.id }, { linkedId: mainPrimary.id }],
        },
        transaction: t,
      });

      const existingEmails = new Set<string>();
      const existingPhones = new Set<string>();
      mainGroupContacts.forEach((contact) => {
        if (contact.email) existingEmails.add(contact.email);
        if (contact.phoneNumber) existingPhones.add(contact.phoneNumber);
      });

      let createNewSecondary = false;
      if (email && !existingEmails.has(email)) createNewSecondary = true;
      if (phoneNumber && !existingPhones.has(phoneNumber))
        createNewSecondary = true;

      if (createNewSecondary) {
        await Contact.create(
          {
            email,
            phoneNumber,
            linkedId: mainPrimary.id,
            linkPrecedence: "secondary",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction: t }
        );
      }

      const updatedMainGroupContacts = await Contact.findAll({
        where: {
          [Op.or]: [{ id: mainPrimary.id }, { linkedId: mainPrimary.id }],
        },
        order: [["createdAt", "ASC"]],
        transaction: t,
      });

      const primaryContact = updatedMainGroupContacts.find(
        (c) => c.id === mainPrimary.id
      )!;
      const secondaryContacts = updatedMainGroupContacts
        .filter((c) => c.id !== mainPrimary.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const emails: string[] = [];
      const emailSet = new Set<string>();
      if (primaryContact.email) {
        emails.push(primaryContact.email);
        emailSet.add(primaryContact.email);
      }

      const phoneNumbers: string[] = [];
      const phoneSet = new Set<string>();
      if (primaryContact.phoneNumber) {
        phoneNumbers.push(primaryContact.phoneNumber);
        phoneSet.add(primaryContact.phoneNumber);
      }

      secondaryContacts.forEach((contact) => {
        if (contact.email && !emailSet.has(contact.email)) {
          emails.push(contact.email);
          emailSet.add(contact.email);
        }
        if (contact.phoneNumber && !phoneSet.has(contact.phoneNumber)) {
          phoneNumbers.push(contact.phoneNumber);
          phoneSet.add(contact.phoneNumber);
        }
      });

      const secondaryContactIds = secondaryContacts.map((c) => c.id);

      return {
        primaryContactId: mainPrimary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      };
    });

    res.status(200).json({ contact: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
export default identify;
