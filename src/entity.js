

export function createEntity(){
    let _maxHealth;
    let _currentHealth;

    const init = () => {
        _maxHealth = 100;
        _currentHealth = _maxHealth;
    }

    const damage = (baseDamage) => {
        _currentHealth -= baseDamage;

        if(_currentHealth < 0)
            _currentHealth = 0;

        console.log('currentHealth: ' + _currentHealth)
    }

    const heal = (healthIncrease) => {
        _currentHealth += healthIncrease;

        if(_currentHealth > _maxHealth)
            _currentHealth = _maxHealth;
    }

    const fullHeal = () => {
        _currentHealth = _maxHealth;
    }

    return{
        init,
        damage,
        heal,
        fullHeal,
        get CurrentHealth() { return _currentHealth},
        set CurrentHealth(value) { _currentHealth = (value > _maxHealth) ? _maxHealth : value },
        get MaxHealth() { return _maxHealth },
        set MaxHealth(value) { _maxHealth = value }
    }
}