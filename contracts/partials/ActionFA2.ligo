type transfer_params is list (transfer_param)
type balance_params is michelson_pair_right_comb(balance_params_r)
type token_metadata_registry_params is contract (address)
type update_operator_params is list (update_operator_param)

type token_action is
| ITransfer                of transfer_params
| IBalance_of              of balance_params
| IToken_metadata_registry of token_metadata_registry_params
| IUpdate_operators        of update_operator_params

type full_action is
| Use of use_params
| Transfer                of transfer_params
| Balance_of              of balance_params
| Token_metadata_registry of token_metadata_registry_params
| Update_operators        of update_operator_params
