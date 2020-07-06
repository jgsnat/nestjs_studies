import { BaseQueryParameterDto } from "src/shared/dto/base-query-parameters.dto";

export class FindUsersQueryDto extends BaseQueryParameterDto {
    name: string;
    email: string;
    status: boolean;
    role: string;
}