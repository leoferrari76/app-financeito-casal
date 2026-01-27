#!/bin/bash

# Adiciona todas as mudanças
git add .

# Pergunta pela mensagem do commit
echo "Digite a mensagem do seu commit (ex: alteração no layout) e pressione [ENTER]:"
read message

# Se a mensagem estiver vazia, usa um padrão
if [ -z "$message" ]; then
    message="update: $(date +'%Y-%m-%d %H:%M:%S')"
fi

# Faz o commit
git commit -m "$message"

# Envia para o GitHub
git push origin main

echo "---------------------------------------"
echo "✅ Alterações enviadas para o GitHub!"
echo "---------------------------------------"
