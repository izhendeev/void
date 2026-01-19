// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameLeaderboard
 * @dev Максимально простой и безопасный контракт для хранения рекордов игры
 * Минимальный функционал для прохождения модерации Base
 */
contract GameLeaderboard {
    // Структура для хранения рекорда игрока
    struct PlayerRecord {
        uint256 bestScore;
        uint256 timestamp;
    }

    // Маппинг адрес игрока -> его рекорд
    mapping(address => PlayerRecord) public records;
    
    // Событие для отслеживания сохраненных рекордов
    event RecordSaved(address indexed player, uint256 score, uint256 timestamp);

    /**
     * @dev Сохранить рекорд игрока (только если он лучше предыдущего)
     * @param score Счет игрока
     */
    function saveRecord(uint256 score) external {
        require(score > 0, "Score must be greater than 0");
        
        PlayerRecord storage currentRecord = records[msg.sender];
        
        // Сохраняем только если новый счет лучше предыдущего
        if (score > currentRecord.bestScore) {
            currentRecord.bestScore = score;
            currentRecord.timestamp = block.timestamp;
            
            emit RecordSaved(msg.sender, score, block.timestamp);
        }
    }

    /**
     * @dev Получить рекорд игрока
     * @param player Адрес игрока
     * @return bestScore Лучший счет
     * @return timestamp Время установки рекорда
     */
    function getRecord(address player) external view returns (uint256 bestScore, uint256 timestamp) {
        PlayerRecord memory record = records[player];
        return (record.bestScore, record.timestamp);
    }

    /**
     * @dev Получить рекорд текущего игрока
     * @return bestScore Лучший счет
     * @return timestamp Время установки рекорда
     */
    function getMyRecord() external view returns (uint256 bestScore, uint256 timestamp) {
        PlayerRecord memory record = records[msg.sender];
        return (record.bestScore, record.timestamp);
    }
}
