# Meu Condo — Accountability Documents: Upload, OCR e Q&A

Este módulo adiciona upload de documentos (recibos/notas), OCR e perguntas e respostas (Q&A) sobre o conteúdo extraído. Ideal para prestação de contas: o síndico envia o documento e os moradores conseguem ver e tirar dúvidas sobre valores, itens e datas.

Principais recursos
- Upload de PDF/imagem e deduplicação por hash (SHA-256).
- OCR:
  - PDF: extração de texto digital via pdf-parse.
  - Imagens: OCR via tesseract.js (por padrão, por+eng).
- Armazenamento local em data/uploads e exposição estática via /uploads.
- Registro no banco em AccountabilityDocument, com status de OCR e metadados.
- Persistência de extração estruturada (JSON) feita por LLM (opcional).
- Q&A em cima do texto OCR e do JSON extraído, com grounding para reduzir alucinações.

Sumário
- Pré-requisitos
- Variáveis de ambiente
- Migrações e execução
- Endpoints
- Notas de OCR e LLM
- Segurança e controle de acesso
- Erros e status

Pré-requisitos
- Node.js 18+
- Postgres rodando (docker-compose incluso)
- Para Q&A e extração via LLM: uma chave da API da OpenAI


Variáveis de ambiente
Crie um arquivo .env baseado nos campos abaixo.

```/dev/null/.env#L1-200
# Banco de dados
DATABASE_URL="postgresql://postgres:docker@localhost:5432/meu-condo?schema=public"

# HTTP server
PORT=3000

# URL base pública para servir os arquivos de upload (default: http://localhost:3000/uploads)
# Se estiver atrás de proxy/CDN, use a URL pública final.
FILE_BASE_URL="http://localhost:3000/uploads"

# OCR - línguas do Tesseract (default: por+eng)
OCR_LANG="por+eng"

# OpenAI (opcional, necessário para Q&A/extração por LLM)
OPENAI_API_KEY="sk-..."
# Modelo padrão (opcional). Ex.: gpt-4o-mini, gpt-4o, gpt-4.1-mini, etc.
OPENAI_MODEL="gpt-4o-mini"
```

Migrações e execução
1) Suba o Postgres:
```/dev/null/terminal.sh#L1-10
docker compose up -d postgres
```

2) Instale dependências:
```/dev/null/terminal.sh#L1-10
npm install
```

3) Execute as migrações do Prisma (gera o modelo AccountabilityDocument e enum DocumentOcrStatus):
```/dev/null/terminal.sh#L1-10
npx prisma migrate dev --name add_accountability_documents
```

4) Rode em desenvolvimento:
```/dev/null/terminal.sh#L1-10
npm run dev
```

Arquivos estáticos
- Os uploads são gravados em data/uploads.
- Os arquivos ficam acessíveis via GET /uploads/{fileName}.

Modelo de dados (novo)
- AccountabilityDocument
  - id, condominiumId, accountabilityId?
  - fileUrl, fileName, mimeType, fileSize, fileHash (deduplicação)
  - ocrStatus: PENDING | PROCESSING | SUCCEEDED | FAILED
  - ocrProvider, ocrText, ocrConfidence
  - extracted (JSON da extração estruturada), extractedAt
  - processedAt, errorMessage
  - createdAt, updatedAt


Endpoints

Autenticação e autorização
- Todos os endpoints abaixo exigem Authorization: Bearer <token> e papel ADMIN.

1) Upload de documento
POST /accountability-documents
- multipart/form-data
- Campos:
  - file: arquivo (obrigatório)
  - condominiumId: string (obrigatório)
  - accountabilityId: string (opcional)
  - processNow: boolean (opcional; se true, roda OCR na hora)
  - ocrLang: string (opcional; ex: por+eng)

Exemplo curl:
```/dev/null/requests.http#L1-40
curl -X POST http://localhost:3000/accountability-documents \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -F "file=@/caminho/para/documento.pdf" \
  -F "condominiumId=UUID-DO-CONDOMINIO" \
  -F "processNow=true" \
  -F "ocrLang=por+eng"
```

Resposta (resumo):
```/dev/null/response.json#L1-60
{
  "id": "doc-uuid",
  "condominiumId": "UUID-DO-CONDOMINIO",
  "accountabilityId": null,
  "fileUrl": "http://localhost:3000/uploads/<hash>-documento.pdf",
  "fileName": "<hash>-documento.pdf",
  "mimeType": "application/pdf",
  "fileSize": 12345,
  "fileHash": "<sha256>",
  "ocrStatus": "SUCCEEDED",
  "ocrProvider": "pdf-parse",
  "ocrText": "Texto extraído...",
  "ocrConfidence": 0.99,
  "extracted": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

2) Processar OCR (caso não tenha usado processNow)
POST /accountability-documents/:id/process
- Body JSON: { "ocrLang": "por+eng" } (opcional)

```/dev/null/requests.http#L1-20
curl -X POST http://localhost:3000/accountability-documents/<docId>/process \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{ "ocrLang": "por+eng" }'
```

3) Salvar extração estruturada (resultado do LLM ou de outro provedor)
POST /accountability-documents/:id/extracted
- Body JSON: { extracted: <objeto>, provider?: string, confidence?: number }

```/dev/null/requests.http#L1-200
curl -X POST http://localhost:3000/accountability-documents/<docId>/extracted \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "extracted": {
      "supplier": { "name": "Fornecedor XYZ", "cnpj": "12.345.678/0001-90" },
      "issue_date": "2025-01-31",
      "items": [
        { "description": "Limpeza de áreas comuns", "quantity": 1, "unit_price": 500.00, "total": 500.00 }
      ],
      "totals": { "subtotal": 500.00, "total": 500.00, "currency": "BRL" }
    },
    "provider": "openai:gpt-4o-mini",
    "confidence": 0.9
  }'
```

4) Listar documentos por condomínio
GET /accountability-documents/condominium/:condominiumId

```/dev/null/requests.http#L1-20
curl -X GET http://localhost:3000/accountability-documents/condominium/UUID-DO-CONDOMINIO \
  -H "Authorization: Bearer <JWT_ADMIN>"
```

5) Buscar documento por ID
GET /accountability-documents/:id

```/dev/null/requests.http#L1-20
curl -X GET http://localhost:3000/accountability-documents/<docId> \
  -H "Authorization: Bearer <JWT_ADMIN>"
```

6) Excluir documento
DELETE /accountability-documents/:id

```/dev/null/requests.http#L1-20
curl -X DELETE http://localhost:3000/accountability-documents/<docId> \
  -H "Authorization: Bearer <JWT_ADMIN>"
```

7) Q&A sobre o documento
POST /accountability-documents/:id/qa
- Body JSON:
  - question: string (obrigatório)
  - includeFullExtractedJson?: boolean (opcional)
  - model?: string (opcional, override do modelo)
  - temperature?: number (opcional)

```/dev/null/requests.http#L1-120
curl -X POST http://localhost:3000/accountability-documents/<docId>/qa \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual é o valor total desta nota?",
    "includeFullExtractedJson": false
  }'
```

Resposta (resumo):
```/dev/null/response.json#L1-120
{
  "documentId": "doc-uuid",
  "ocrStatus": "SUCCEEDED",
  "answer": "O total informado é R$ 500,00.",
  "model": "gpt-4o-mini",
  "snippets": [
    { "source": "ocr", "text": "Total: R$ 500,00", "score": 1.3 },
    { "source": "extracted", "text": "\"total\": 500.00", "score": 1.0 }
  ],
  "warnings": [],
  "usage": { "inputTokens": 123, "outputTokens": 34 }
}
```

Observações importantes
- Se OPENAI_API_KEY não estiver configurada, o endpoint de Q&A retorna um fallback heurístico (sem LLM), listando trechos relevantes.
- Para respostas melhores, mantenha a pergunta objetiva e em português.
- Você pode enviar o JSON extraído previamente (POST /:id/extracted) para enriquecer o contexto do Q&A.

Acesso aos arquivos enviados
- Após upload, o arquivo fica disponível em fileUrl, por exemplo:
  - http://localhost:3000/uploads/<hash>-documento.pdf


Notas de OCR e LLM

OCR
- PDF: usa pdf-parse para extrair texto digital embutido (alta confiança).
- Imagens: usa tesseract.js (WASM). A confiança média é estimada; para melhor qualidade, use imagens nítidas e com boa iluminação.
- Idiomas: configure OCR_LANG (ex.: por+eng). 
- Limite de tamanho: 20 MB por arquivo (configurável no multer).

LLM (extração e Q&A)
- Variável OPENAI_API_KEY é necessária para chamadas ao LLM.
- Modelo padrão OPENAI_MODEL = gpt-4o-mini (pode ser sobrescrito por requisição).
- Extração estruturada: você pode implementar um job que pega o ocrText e chama seu extrator LLM para popular o campo extracted via POST /:id/extracted.


Segurança e controle de acesso
- Todos os endpoints requerem autenticação JWT e role ADMIN.
- Garanta no gateway/API que moradores só acessem documentos do seu condomínio.


Erros e status
- ocrStatus:
  - PENDING: aguardando processamento
  - PROCESSING: em processamento
  - SUCCEEDED: processado com sucesso (ocrText preenchido)
  - FAILED: falha no OCR (consulte errorMessage)
- Deduplicação: ao enviar o mesmo arquivo (mesmo hash), o backend retorna o documento existente.
- Campos úteis de depuração no AccountabilityDocument:
  - errorMessage (em caso de falha),
  - ocrProvider, ocrConfidence,
  - processedAt, extractedAt.


Dicas de produção
- Ajuste FILE_BASE_URL com a URL pública real do serviço de arquivos.
- Centralize uploads em um storage (S3/GCS) se necessário; a API aceita adaptar a persistência.
- Proteja /uploads conforme sua política (assinado/privado) em ambientes não públicos.