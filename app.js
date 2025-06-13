const fetch = require("node-fetch");
const cheerio = require("cheerio");

const url = "https://www.tecmundo.com.br/";

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

async function main() {
  const noticias = await fetchNoticiasTecmundo();
  if (noticias.length > 0) {
    console.log("Notícias encontradas no TecMundo:");
    noticias.forEach((titulo, i) => {
      console.log(`${i + 1}. ${titulo}`);
    });
  } else {
    console.log("Nenhuma notícia encontrada.");
  }
}

main();
