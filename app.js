require("dotenv").config();
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const readline = require("readline");

const url = "https://www.tecmundo.com.br/";

// Configuração para ler input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// FUNÇÃO ORIGINAL DE SCRAPING (exatamente como você tem)
async function fetchNoticiasTecmundo() {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const noticias = [];

    // Seleciona os títulos das notícias - tanto os h2 quanto os links com a classe específica
    $("h2.styles_title__TRNiL, a.styles_link__CeSqL").each((i, el) => {
      const titulo = $(el).text().trim();
      if (titulo) {
        noticias.push(titulo);
      }
    });

    return noticias;
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return [];
  }
}

// Configuração do transporter de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para enviar e-mail
async function sendEmail(noticias, emailDestino) {
  try {
    let htmlContent = "<h2>📰 Últimas Notícias do TecMundo</h2><ul>";

    noticias.forEach((titulo, i) => {
      htmlContent += `<li>${i + 1}. ${titulo}</li>`;
    });

    htmlContent += "</ul>";

    const info = await transporter.sendMail({
      from: `"Notícias TecMundo" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: "Últimas notícias do TecMundo",
      html: htmlContent,
    });

    console.log("\nE-mail enviado para %s", emailDestino);
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
  }
}

async function main() {
  const noticias = await fetchNoticiasTecmundo();

  if (noticias.length > 0) {
    console.log("\nNotícias encontradas no TecMundo:");
    noticias.forEach((titulo, i) => {
      console.log(`${i + 1}. ${titulo}`);
    });

    // Pergunta ao usuário para qual e-mail enviar
    rl.question(
      "\nPara qual e-mail você deseja enviar estas notícias? ",
      async (emailDestino) => {
        if (emailDestino && emailDestino.includes("@")) {
          await sendEmail(noticias, emailDestino);
        } else {
          console.log("E-mail inválido ou não fornecido. Envio cancelado.");
        }
        rl.close();
      }
    );
  } else {
    console.log("Nenhuma notícia encontrada.");
    rl.close();
  }
}

main();
