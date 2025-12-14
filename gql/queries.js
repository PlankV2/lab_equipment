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

const getEquipments = gql`
	query MyQuery {
		labEquipments {
			missing
			name
			totalQuantity
			category
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

const queries = { getEquipment, test, getEquipments };

export default queries;
