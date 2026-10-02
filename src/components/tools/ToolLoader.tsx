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
import SimuladorParcelamento from "./SimuladorParcelamento";
import SimuladorRendimento from "./SimuladorRendimento";
import RescisaoTrabalhista from "./RescisaoTrabalhista";
import Financiamento from "./Financiamento";
import DasMei from "./DasMei";
import GeradorCurriculo from "./GeradorCurriculo";
import ConsultaFipe from "./ConsultaFipe";
import ReajusteAluguel from "./ReajusteAluguel";
import CorrecaoInflacao from "./CorrecaoInflacao";
import JurosCompostos from "./JurosCompostos";
import ComparadorInvestimentos from "./ComparadorInvestimentos";
import ReservaEmergencia from "./ReservaEmergencia";
import Orcamento503020 from "./Orcamento503020";
import JurosParcelamento from "./JurosParcelamento";
import Porcentagem from "./Porcentagem";
import ViverDeRenda from "./ViverDeRenda";

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
  "simulador-de-parcelamento": SimuladorParcelamento,
  "rendimento-basico": SimuladorRendimento,
  "rescisao-trabalhista": RescisaoTrabalhista,
  financiamento: Financiamento,
  "das-mei": DasMei,
  "gerador-de-curriculo": GeradorCurriculo,
  "consulta-fipe": ConsultaFipe,
  "reajuste-de-aluguel": ReajusteAluguel,
  "correcao-pela-inflacao": CorrecaoInflacao,
  "juros-compostos": JurosCompostos,
  "comparador-de-investimentos": ComparadorInvestimentos,
  "reserva-de-emergencia": ReservaEmergencia,
  "orcamento-50-30-20": Orcamento503020,
  "juros-do-parcelamento": JurosParcelamento,
  "calculadora-de-porcentagem": Porcentagem,
  "viver-de-renda": ViverDeRenda,
};

export function hasTool(slug: string): boolean {
  return slug in TOOLS;
}

export function ToolLoader({ slug }: { slug: string }) {
  const Tool = TOOLS[slug];
  if (!Tool) return null;
  return <Tool />;
}
