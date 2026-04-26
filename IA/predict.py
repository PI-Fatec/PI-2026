import pickle
import pandas as pd

# 1 Carregar modelos e scalers
def load_models():
    print("\n" + "="*80)
    print("Carregando modelos e scalers")
    print("="*80)
    
    with open("models/modelo_supervisionado.pkl", "rb") as f:
        modelo_classificacao = pickle.load(f)
    print("Modelo de classificação carregado")
    
    with open("models/modelo_clustering.pkl", "rb") as f:
        modelo_clustering = pickle.load(f)
    print("Modelo de clustering carregado")
    
    with open("models/scaler_classificacao.pkl", "rb") as f:
        scaler_classificacao = pickle.load(f)
    print("Scaler de classificação carregado")
    
    with open("models/scaler_clustering.pkl", "rb") as f:
        scaler_clustering = pickle.load(f)
    print("Scaler de clustering carregado")
    
    with open("models/cluster_labels.pkl", "rb") as f:
        cluster_labels = pickle.load(f)
    print("Labels dos clusters carregados")
    
    return modelo_classificacao, modelo_clustering, scaler_classificacao, scaler_clustering, cluster_labels


# 2 Previsão de risco de diabetes (classificação supervisionada)
def prever_risco_diabetes(paciente_data, modelo, scaler):
    
    X = pd.DataFrame([paciente_data])
    X_scaled = scaler.transform(X)
    
    predicao = modelo.predict(X_scaled)[0]
    probabilidade = modelo.predict_proba(X_scaled)[0]
    
    return {
        'risco': 'COM DIABETES' if predicao == 1 else 'SEM DIABETES',
        'classe': int(predicao),
        'prob_sem_diabetes': probabilidade[0],
        'prob_com_diabetes': probabilidade[1],
        'confianca': f"{max(probabilidade):.2%}"
    }


# 3 Perfil do paciente (clustering não supervisionado)
def identificar_perfil_paciente(paciente_data, modelo_clustering, scaler, cluster_labels):
    
    X = pd.DataFrame([paciente_data])
    X_scaled = scaler.transform(X)
    
    cluster = modelo_clustering.predict(X_scaled)[0]
    
    perfil = cluster_labels.get(cluster, "Perfil desconhecido")
    
    return {
        'cluster': int(cluster),
        'perfil': perfil
    }


# 4 ANÁLISE COMPLETA
def analisar_paciente(paciente_data):
    
    modelo_class, modelo_cluster, scaler_class, scaler_cluster, cluster_labels = load_models()
    
    print("\n" + "="*80)
    print("Analisando paciente")
    print("="*80)
    
    # Classificação
    risco = prever_risco_diabetes(paciente_data, modelo_class, scaler_class)
    
    print("\nPrevisão de risco de diabetes:")
    print("="*80)
    print(f"Resultado: {risco['risco']}")
    print(f"Confiança: {risco['confianca']}")
    print(f"Probabilidade de diabetes: {risco['prob_com_diabetes']:.2%}")
    
    # Clustering
    perfil = identificar_perfil_paciente(
        paciente_data, modelo_cluster, scaler_cluster, cluster_labels
    )
    
    print("\nPerfil do paciente:")
    print("="*80)
    print(f"Cluster: {perfil['cluster']}")
    print(f"Perfil: {perfil['perfil']}")
    
    return risco, perfil


# 5. Exemplo de uso com dados fictícios, basta alterar os valores para testar diferentes resultados
def exemplo():
    
    novo_paciente = {
        'HighBP': 1.0,                  # pressão alta 0/1
        'HighChol': 1.0,                # colesterol 0/1
        'BMI': 30.0,                    # IMC
        'Smoker': 1.0,                  # fumante 0/1
        'Stroke': 0.0,                  # histórico de AVC 0/1
        'HeartDiseaseorAttack': 0.0,    # doença cardíaca 0/1
        'PhysActivity': 1.0,            # faz atividades físicas 0/1
        'Fruits': 0.0,                  # come frutas 0/1
        'Veggies': 0.0,                 # come vegetais 0/1
        'HvyAlcoholConsump': 0.0,       # consumo de álcool 0/1
        'DiffWalk': 0.0,                # mobilidade reduzida 0/1
        'Sex': 1.0,                     # masculino ou feminino 1/0
        'Age': 6.0                     # idade
    }
    
    print("\nDados do paciente:")
    print(f"BMI(IMC): {novo_paciente['BMI']}")
    print(f"Fumante: {'Sim' if novo_paciente['Smoker'] else 'Não'}")
    print(f"Atividade física: {'Sim' if novo_paciente['PhysActivity'] else 'Não'}")
    
    analisar_paciente(novo_paciente)


# Executar exemplo
if __name__ == "__main__":
    exemplo()