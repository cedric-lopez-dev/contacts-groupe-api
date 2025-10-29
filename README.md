# Contacts Groupe API

## Description

This API serves as a gateway between **DocuWare** (Contacts Groupe's document management system) and **Dolibarr** (ERP).

## How it works

When a membership form is filled out in DocuWare, a webhook triggers this API which automatically feeds **Dolibarr** with:
- Members
- Third parties
- Contacts

This process enables automatic synchronization between the two systems, avoiding manual data entry in Dolibarr.

