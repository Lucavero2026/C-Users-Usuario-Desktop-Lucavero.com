"use client";

import type { ComponentType } from "react";
import SalarioLiquido from "./SalarioLiquido";
import Irrf from "./Irrf";
import FeriasDecimo from "./FeriasDecimo";
import ValorHora from "./ValorHora";
import ConversorMoedas from "./ConversorMoedas";
import JurosBoleto from "./JurosBoleto";
import ConsultaCep from "./ConsultaCep";
import ConsultaCnpj from "./ConsultaCnpj";
import ConsultaBancos from "./ConsultaBancos";
import Feriados from "./Feriados";
import DiasUteis from "./DiasUteis";
import PixGerador from "./PixGerador";
import LinkWhatsapp from "./LinkWhatsapp";
import QrCodeTool from "./QrCodeTool";
import GeradorDocumentos from "./GeradorDocumentos";
import Recibo from "./Recibo";
import DecodificadorJuridiques from "./DecodificadorJuridiques";
import GeradorContratos from "./GeradorContratos";
import ConsulteDireitos from "./ConsulteDireitos";
import Requerimentos from "./Requerimentos";

/** Mapa slug → componente da ferramenta. */
const TOOLS: Record<string, ComponentType> = {
  "salario-liquido": SalarioLiquido,
  irrf: Irrf,
  "ferias-e-decimo-terceiro": FeriasDecimo,
  "valor-da-hora": ValorHora,
  "conversor-de-moedas": ConversorMoedas,
  "juros-e-multa-de-boleto": JurosBoleto,
  "consulta-cep": ConsultaCep,
  "consulta-cnpj": ConsultaCnpj,
  "consulta-de-bancos": ConsultaBancos,
  feriados: Feriados,
  "contador-de-dias-uteis": DiasUteis,
  "pix-copia-e-cola": PixGerador,
  "link-whatsapp": LinkWhatsapp,
  "qr-code": QrCodeTool,
  "gerador-de-documentos": GeradorDocumentos,
  "recibo-online": Recibo,
  "decodificador-juridiques": DecodificadorJuridiques,
  "gerador-de-contratos": GeradorContratos,
  "consulte-seus-direitos": ConsulteDireitos,
  "requerimentos-e-recursos": Requerimentos,
};

export function hasTool(slug: string): boolean {
  return slug in TOOLS;
}

export function ToolLoader({ slug }: { slug: string }) {
  const Tool = TOOLS[slug];
  if (!Tool) return null;
  return <Tool />;
}
