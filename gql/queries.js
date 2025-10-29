import { gql } from "@apollo/client";

const getEquipment = gql`
  query getEquipment {
    labEquipments {
      name
      totalQuantity
      missing
      category
      thumbnail {
        url
      }
    }
  }
`;

const test = gql`
  query getEquipment {
    labEquipments {
      name
      totalQuantity
      missing
      category
      thumbnail {
        url
      }
    }
  }
`;

const queries = { getEquipment, test };

export default queries;
