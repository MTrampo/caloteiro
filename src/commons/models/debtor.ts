import type { Database } from "@/commons/types/database.types";

/**
 * Enum numérico nativo de relacionamento do devedor (inicia em 0)
 */
export enum DebtorRelationshipEnum {
  PARENT,           // 0: Parente
  FRIEND,           // 1: Amigo
  COLLEAGUE,        // 2: Trabalho / Colega
  ACQUAINTANCE,     // 3: Conhecido / Terceiro
  SERVICE_PROVIDER, // 4: Prestador de Serviço
  UNKNOWN,          // 5: Desconhecido
  OTHER,            // 6: Outro
}

/**
 * Metadados dos relacionamentos para renderização em selects, badges e cards
 */
export const DEBTOR_RELATIONSHIP_METADATA: Record<
  DebtorRelationshipEnum,
  { label: string; desc: string }
> = {
  [DebtorRelationshipEnum.PARENT]: {
    label: "Parente",
    desc: "Cunhado, primo, irmão... empréstimo de família com risco máximo",
  },
  [DebtorRelationshipEnum.FRIEND]: {
    label: "Amigo",
    desc: "Amigo de infância ou do futebol que sumiu",
  },
  [DebtorRelationshipEnum.COLLEAGUE]: {
    label: "Trabalho / Colega",
    desc: "Colega de trampo, chefe ou parceiro de freela",
  },
  [DebtorRelationshipEnum.ACQUAINTANCE]: {
    label: "Conhecido / Terceiro",
    desc: "Vizinho ou conhecido que pediu 'só até segunda'",
  },
  [DebtorRelationshipEnum.SERVICE_PROVIDER]: {
    label: "Prestador de Serviço",
    desc: "Mecânico, pedreiro ou técnico que deixou pendência",
  },
  [DebtorRelationshipEnum.UNKNOWN]: {
    label: "Desconhecido",
    desc: "Pessoa que surgiu do nada, indicação ou contato não memorizado",
  },
  [DebtorRelationshipEnum.OTHER]: {
    label: "Outro",
    desc: "Indivíduo avulso na praça",
  },
};

/**
 * Entidade de devedor persistida no banco
 */
export type DebtorRow = Database["public"]["Tables"]["debtors"]["Row"];
export type DebtorInsert = Database["public"]["Tables"]["debtors"]["Insert"];
export type DebtorUpdate = Database["public"]["Tables"]["debtors"]["Update"];

export type DebtorItem = DebtorRow;

/**
 * Entidade de devedor tratada para consumo na UI (Formatted)
 * Todas as formatações (ProperName, telefone amigável, URL do WhatsApp e metadata)
 * já chegam prontas do servidor.
 */
export interface DebtorItemFormatted extends DebtorRow {
  formattedName: string;
  formattedNickname: string | null;
  displayPhone: string;
  cleanPhone: string;
  whatsAppUrl: string;
  relationshipLabel: string;
  relationshipDesc: string;
}

/**
 * DTO para criação de devedor
 */
export interface CreateDebtorPayload {
  name: string;
  nickname?: string | null;
  relationship: DebtorRelationshipEnum;
  document?: string | null;
  address?: string | null;
  phone: string;
  pix_key?: string | null;
  pix_key_type?: string | null;
  notes?: string | null;
}

/**
 * DTO para atualização de devedor
 */
export interface UpdateDebtorPayload {
  name?: string;
  nickname?: string | null;
  relationship?: DebtorRelationshipEnum;
  document?: string | null;
  address?: string | null;
  phone?: string;
  pix_key?: string | null;
  pix_key_type?: string | null;
  notes?: string | null;
  is_archived?: boolean;
}

/**
 * Parâmetros de consulta paginada de devedores
 */
export interface GetDebtorsParams {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Resposta paginada de devedores (dados brutos de persistência)
 */
export interface PaginatedDebtors {
  items: DebtorItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Resposta paginada de devedores formatada para a UI
 */
export interface PaginatedDebtorsFormatted {
  items: DebtorItemFormatted[];
  page: number;
  limit: number;
  hasMore: boolean;
  totalCount: number;
}

export type DebtorPixKeyType = "cpf" | "cnpj" | "phone" | "email" | "random" | "aleatoria" | "celular" | "";

/**
 * Tipos de dados inferidos para formulários de UI
 */
export interface CreateDebtorFormInputs {
  name: string;
  nickname?: string;
  relationship: number;
  document?: string;
  address?: string;
  phone: string;
  pix_key?: string;
  pix_key_type?: DebtorPixKeyType;
  notes?: string;
}
